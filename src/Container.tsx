import produce from 'immer';
import { CSSProperties, useCallback, useEffect, useState } from 'react';
import { Card } from './Card';
import { Dance, dances as dancesOriginal } from './dances';

const style: CSSProperties = {
  width: 444,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const dances = (JSON.parse(window.localStorage.getItem('dances')!) as Dance[]) ?? dancesOriginal;

export const Container = () => {
  const [cards, setCards] = useState(dances);

  const textList = cards
    .map(c => `${c.name}\t${c.song} by ${c.artist}\t${c.dancers.join('\t')}`)
    .join('\n');

  useEffect(() => {
    window.localStorage.setItem('dances', JSON.stringify(cards));
  }, [cards]);

  const save = useCallback(
    () => window.localStorage.setItem('dances', JSON.stringify(cards)),
    [cards]
  );

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setCards(prevCards =>
      produce(prevCards, draft => {
        draft.splice(dragIndex, 1);
        draft.splice(hoverIndex, 0, prevCards[dragIndex]);
      })
    );
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textList);
    } catch (e: any) {
      alert(`Could not copy: ${e.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <a
            download="recital-order-2023.txt"
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(
              cards.map(c => c.name).join('\n')
            )}`}>
            Download
          </a>
          <button type="button" onClick={() => setCards(dancesOriginal)}>
            Reset
          </button>
          <button type="button" onClick={save}>
            Save
          </button>
        </div>
        <div style={style}>
          {cards.map((card, index) => {
            const dancersInNextDance = card.dancers.filter(s =>
              cards[index + 1]?.dancers.includes(s)
            );
            const dancersInDanceAfterNext = card.dancers.filter(s =>
              cards[index + 2]?.dancers.includes(s)
            );
            return (
              <Card
                key={card.name}
                isLast={index === cards.length - 1}
                index={index}
                id={card.name}
                dance={card}
                moveCard={moveCard}
                dancersInNextDance={dancersInNextDance}
                dancersInDanceAfterNext={dancersInDanceAfterNext}
              />
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        <div>
          <button type="button" onClick={copy}>
            Copy list
          </button>
        </div>
        <textarea
          style={{ overflowX: 'scroll', whiteSpace: 'pre' }}
          cols={69}
          rows={30}
          disabled
          value={textList}
        />
      </div>
    </div>
  );
};
