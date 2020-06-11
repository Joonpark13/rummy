import React from 'react';
import { Typography, Box } from '@material-ui/core';
import MatchSet from './MatchSet';
import { Card } from '../types';

type TableProps = {
  title: string;
  table: { [index: number]: Card[] };
};

export default function Table({ title, table }: TableProps) {
  return (
    <>
      <Typography variant="subtitle1">{title}</Typography>
      <Box display="flex" flexWrap="wrap">
        {Object.values(table).length === 0 ? (
          <Typography variant="caption">No cards laid down.</Typography>
        ) : (
          Object.values(table).map((matchSet) => (
            <Box key={JSON.stringify(matchSet)} mr={1}>
              <MatchSet matchSet={matchSet} />
            </Box>
          ))
        )}
      </Box>
    </>
  );
}
