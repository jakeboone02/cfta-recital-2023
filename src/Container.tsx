import produce from 'immer';
import { useCallback, useEffect, useState } from 'react';

import { Card } from './Card';
import { Dance, dances } from './dances';

const style = {
  width: 400,
};

export const Container = () => {
  const [cards, setCards] = useState(dances);

  useEffect(() => {
    window.localStorage.setItem('dances-current', JSON.stringify(dances));
  }, [dances]);

  const save = useCallback(
    () => window.localStorage.setItem('dances', JSON.stringify(dances)),
    [dances]
  );

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setCards(prevCards =>
      produce(prevCards, draft => {
        draft.splice(dragIndex, 1);
        draft.splice(hoverIndex, 0, prevCards[dragIndex]);
      })
    );
  }, []);

  const renderCard = useCallback((card: Dance, index: number) => {
    const dancersInNextDance = card.dancers.filter(s => cards[index + 1]?.dancers.includes(s));
    const dancersInDanceAfterNext = card.dancers.filter(s => cards[index + 2]?.dancers.includes(s));
    return (
      <Card
        key={card.name}
        index={index}
        id={card.name}
        text={card.name}
        moveCard={moveCard}
        dancersInNextDance={dancersInNextDance}
        dancersInDanceAfterNext={dancersInDanceAfterNext}
      />
    );
  }, []);

  return (
    <>
      <a
        download="recital-order-2023.txt"
        href={`data:text/plain;charset=utf-8,${encodeURIComponent(
          cards.map(c => c.name).join('\n')
        )}`}>
        Download
      </a>
      &nbsp;
      <button type="button" onClick={save}>
        Save
      </button>
      <div style={style}>{cards.map(renderCard)}</div>
    </>
  );
};
