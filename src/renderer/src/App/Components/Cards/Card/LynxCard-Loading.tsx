import {LoadedCardData} from '@lynx_module/types';
import {useEffect, useMemo, useRef, useState} from 'react';

import {InstalledCards} from '../../../../../../cross/StorageTypes';
import LynxCardSkeleton from './LynxCard-Skeleton';
import LynxCardWrapper from './LynxCard-Wrapper';

type CardDataType = {
  id: string;
  isPlaceholder: boolean;
  originalCard: LoadedCardData;
};

type ProgressiveCardLoaderProps = {
  sortedCards: LoadedCardData[];
  installedCards: InstalledCards;
  hasArguments: Set<string>;
  batchSize?: number;
  batchDelay?: number;
  startDelay?: number;
};

export default function LynxCardLoading({
  sortedCards,
  installedCards,
  hasArguments,
  batchSize = 2,
  batchDelay = 50,
  startDelay = 250,
}: ProgressiveCardLoaderProps) {
  const [visibleCards, setVisibleCards] = useState<CardDataType[]>([]);
  const abortRef = useRef(false);

  const installedSet = useMemo(() => new Set(installedCards.map(c => c.id)), [installedCards]);

  useEffect(() => {
    abortRef.current = false;
    setVisibleCards(
      sortedCards.map(card => ({
        id: card.id,
        isPlaceholder: true,
        originalCard: card,
      })),
    );

    const loadCardsProgressively = async () => {
      if (sortedCards.length === 0) return;

      setVisibleCards(prev => prev.map((c, idx) => (idx === 0 ? {...c, isPlaceholder: false} : c)));

      if (sortedCards.length > 1) {
        await new Promise(resolve => setTimeout(resolve, startDelay));
      }

      for (let i = 1; i < sortedCards.length; i += batchSize) {
        if (abortRef.current) return;

        await new Promise(resolve => setTimeout(resolve, batchDelay));

        if (abortRef.current) return;

        setVisibleCards(prev =>
          prev.map((c, idx) => (idx >= i && idx < i + batchSize ? {...c, isPlaceholder: false} : c)),
        );
      }
    };

    loadCardsProgressively();

    return () => {
      abortRef.current = true;
    };
  }, [sortedCards, batchSize, batchDelay, startDelay]);

  return (
    <>
      {visibleCards.map(cardData => {
        if (!cardData) return null;

        if (cardData.isPlaceholder) {
          return <LynxCardSkeleton key={cardData.id} />;
        }

        const card = cardData.originalCard;
        const isInstalled = installedSet.has(card.id);

        return (
          <LynxCardWrapper
            key={card.id}
            cardData={card}
            isInstalled={isInstalled}
            hasArguments={hasArguments.has(card.id)}
          />
        );
      })}
    </>
  );
}
