import React from 'react';
import { Typography, Box } from '@material-ui/core';
import MatchSet from './MatchSet';
import { MatchSet as MatchSetType } from '../types';

type MatchSetsProps = {
  title: string;
  matchSets: MatchSetType[];
};

export default function MatchSets({ title, matchSets }: MatchSetsProps) {
  return (
    <>
      <Typography variant="subtitle1">{title}</Typography>
      <Box display="flex" flexWrap="wrap">
        {matchSets.length === 0 ? (
          <Typography variant="caption">No cards laid down.</Typography>
        ) : (
          matchSets.map((matchSet) => (
            <Box key={JSON.stringify(matchSet)} mr={1} mb="4px">
              <MatchSet matchSet={matchSet} />
            </Box>
          ))
        )}
      </Box>
    </>
  );
}
