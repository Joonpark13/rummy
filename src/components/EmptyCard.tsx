import React from 'react';
import styled from 'styled-components';
import { Paper, Typography } from '@material-ui/core';

const StyledPaper = styled(Paper)`
  width: 28px;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default function EmptyCard() {
  return (
    <StyledPaper elevation={2}>
      <Typography variant="body1">?</Typography>
    </StyledPaper>
  );
}
