import React from 'react';
import { Box } from '@material-ui/core';
import Table from './components/Table';
import { Round } from './types';
import { EXPANSION_PANEL_HEIGHT } from './constants';
import { useCurrentUser } from './firebase';

type YourTableProps = {
  round: Round;
};

export default function YourTable({ round }: YourTableProps) {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return null;
  }

  const yourTable = round.playerCards[currentUser.uid].laid;
  return (
    <div>
      <Table title="Your Table" table={yourTable} />

      <Box height={EXPANSION_PANEL_HEIGHT} />
    </div>
  );
}
