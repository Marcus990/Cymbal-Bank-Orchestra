
import React from 'react';
import { CymbalIcon } from './icons/CymbalIcon';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-center space-x-4 mt-8">
        <CymbalIcon className="w-10 h-10 text-cymbal-accent" />
        <h1 className="text-3xl font-bold tracking-wider text-cymbal-text-primary">
          Cymbal Bank
        </h1>
      </div>
    </header>
  );
};
