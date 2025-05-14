import {useEffect, useState} from 'react';

import {InstalledCard, InstalledCards} from '../../../../../../cross/StorageTypes';
import {FcPropCardData} from '../../../Extensions/ExtensionTypes_Renderer';
import {CardData} from '../../../Modules/types';
import {CardContext, CardsDataManager} from '../CardsDataManager';
import LynxCard from './LynxCard';
import LynxCardSkeleton from './LynxCard-Skeleton';

type CardDataType = {
  id: string;
  isPlaceholder: boolean;
  originalCard: CardData;
};

type ProgressiveCardLoaderProps = {
  sortedCards: CardData[];
  installedCards: InstalledCards;
  ReplaceComponent?: FcPropCardData;
  batchSize?: number;
  batchDelay?: number;
  startDelay?: number;
};

export default function LynxCardLoading({
  sortedCards,
  installedCards,
  ReplaceComponent,
  batchSize = 1,
  batchDelay = 100,
  startDelay = 250,
}: ProgressiveCardLoaderProps) {
  const [visibleCards, setVisibleCards] = useState<CardDataType[]>([]);

  useEffect(() => {
    setVisibleCards([]);

    const loadCardsProgressively = async () => {
      setVisibleCards(
        sortedCards.map(card => ({
          id: card.id,
          isPlaceholder: true,
          originalCard: card,
        })),
      );

      if (sortedCards.length > 0) {
        setVisibleCards(prevCards => {
          const newCards = [...prevCards];
          newCards[0] = {
            id: sortedCards[0].id,
            isPlaceholder: false,
            originalCard: sortedCards[0],
          };
          return newCards;
        });

        if (sortedCards.length > 1) {
          await new Promise(resolve => setTimeout(resolve, startDelay));
        }
      }

      for (let i = 1; i < sortedCards.length; i += batchSize) {
        if (i > 1) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }

        setVisibleCards(prevCards => {
          const newCards = [...prevCards];
          for (let j = i; j < i + batchSize && j < sortedCards.length; j++) {
            newCards[j] = {
              id: sortedCards[j].id,
              isPlaceholder: false,
              originalCard: sortedCards[j],
            };
          }
          return newCards;
        });
      }
    };

    loadCardsProgressively();
  }, [sortedCards, batchSize, batchDelay, startDelay]);

  return (
    <>
      {visibleCards.map((cardData, index) => {
        if (cardData.isPlaceholder) {
          return <LynxCardSkeleton key={`placeholder-${cardData.id}-${index}`} />;
        } else {
          const card = cardData.originalCard;
          const isInstalled = installedCards.some((iCard: InstalledCard) => iCard.id === card.id);
          const context = new CardsDataManager(card, isInstalled);

          return (
            <CardContext.Provider value={context} key={`cardProv-${index}`}>
              {ReplaceComponent ? (
                <ReplaceComponent context={context} key={`${card.id}-card-key`} />
              ) : (
                <LynxCard key={`${card.id}-card-key`} />
              )}
            </CardContext.Provider>
          );
        }
      })}
    </>
  );
}
