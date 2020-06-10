import React from 'react';
import { Typography, Box } from '@material-ui/core';
import MatchSet from '../MatchSet';
import { Card } from '../types';

type TableProps = {
  title: string;
  table: Card[][];
};

export default function Table({ title, table }: TableProps) {
  return (
    <>
      <Typography variant="subtitle1">{title}</Typography>
      <Box display="flex" flexWrap="wrap">
        {table.length === 0 ? (
          <Typography variant="caption">No cards laid down.</Typography>
        ) : (
          table.map((matchSet) => (
            <Box key={JSON.stringify(matchSet)} mr="4px">
              <MatchSet matchSet={matchSet} />
            </Box>
          ))
        )}
      </Box>
    </>
  );
}
