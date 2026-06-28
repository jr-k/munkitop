import styled from 'styled-components';

export const FlashMessageContainer = styled.div<{ $tone: 'success' | 'error' }>`
  background: ${({ $tone }) => ($tone === 'success' ? '#dcfce7' : '#fee2e2')};
  border: 1px solid ${({ $tone }) => ($tone === 'success' ? '#86efac' : '#fecaca')};
  border-radius: 14px;
  color: ${({ $tone }) => ($tone === 'success' ? '#166534' : '#991b1b')};
  font-weight: 700;
  padding: 14px 16px;
`;
