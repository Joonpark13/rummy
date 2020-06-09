import React from 'react';
import { Box, Typography, Card, CardContent, CardActions } from '@material-ui/core';

type HomeSectionProps = {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function HomeSection({ title, children, actions }: HomeSectionProps) {
  return (
    <>
      <Box mb={1}>
        <Typography variant="h5">{title}</Typography>
      </Box>
      <Card>
        <CardContent>{children}</CardContent>
        {actions && (
          <CardActions>{actions}</CardActions>
        )}
      </Card>
    </>
  );
}
