import React from 'react';

interface QueryBoxProps {
  value: string;
  onChange: React.ChangeEventHandler;
}

/**
 * Displays and updates query text.
 */
export const QueryBox: React.FC<QueryBoxProps> = ({ value, onChange }) => (
  <input type="text" placeholder="Search repositories" onChange={onChange} value={value} />
);
