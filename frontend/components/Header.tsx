
import React from 'react';
import { CymbalIcon } from './icons/CymbalIcon';

export const Header: React.FC = () => {
  return (
    <header className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-4 sm:mt-6 lg:mt-8">
          <CymbalIcon className="w-8 h-8 sm:w-10 sm:h-10 text-cymbal-accent flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-cymbal-text-primary">
            Cymbal Bank
          </h1>
        </div>
      </div>
    </header>
  );
};
