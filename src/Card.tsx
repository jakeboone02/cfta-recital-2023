import type { Identifier, XYCoord } from 'dnd-core';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Dance } from './dances';

const CARD = 'card' as const;

const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  cursor: 'move',
};

export interface CardProps {
  id: any;
  dance: Dance;
  index: number;
  isLast: boolean;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  dancersInNextDance: string[];
  dancersInDanceAfterNext: string[];
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const Card = ({
  id,
  dance,
  index,
  isLast,
  moveCard,
  dancersInNextDance,
  dancersInDanceAfterNext,
}: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: CARD,
    item: () => ({ id, index }),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));
  preview(previewRef);

  return (
    <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div ref={previewRef} style={{ fontWeight: 'bold' }} title={dance.dancers.join('\n')}>
          {dance.name}
        </div>
        <div>
          <button type="button" disabled={index === 0} onClick={() => moveCard(index, index - 1)}>
            ↑
          </button>
          <button type="button" disabled={isLast} onClick={() => moveCard(index, index + 1)}>
            ↓
          </button>
        </div>
      </div>
      <div style={{ color: 'gray' }}>
        <em>
          "{dance.song}" by {dance.artist}
        </em>
      </div>
      {dancersInNextDance.length > 0 && (
        <>
          <div style={{ marginTop: '0.5rem' }}>In next dance:</div>
          {dancersInNextDance.map(s => (
            <div key={s} style={{ color: 'red' }}>
              - {s}
            </div>
          ))}
        </>
      )}
      {dancersInDanceAfterNext.length > 0 && (
        <>
          <div style={{ marginTop: '0.5rem' }}>In dance after next:</div>
          {dancersInDanceAfterNext.map(s => (
            <div key={s} style={{ color: 'red' }}>
              - {s}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
