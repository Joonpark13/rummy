import React from 'react';
import { Box } from '@material-ui/core';
import MatchSets from './components/MatchSets';
import { Round } from './types';
import { EXPANSION_PANEL_HEIGHT } from './constants';
import { useCurrentUser } from './firebase/hooks';
import { getUserMatchSets } from './util';

type YourMatchSetsProps = {
  round: Round;
};

export default function YourMatchSets({ round }: YourMatchSetsProps) {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return null;
  }

  const yourMatchSets = getUserMatchSets(round.table, currentUser.uid);
  return (
    <div>
      <MatchSets title="Your Table" matchSets={yourMatchSets} />

      <Box height={EXPANSION_PANEL_HEIGHT} />
    </div>
  );
}
