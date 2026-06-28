import styled from 'styled-components';

export const IconFrame = styled.span<{ $type: 'group' | 'person' }>`
  align-items: center;
  background: ${({ $type }) => ($type === 'group' ? '#ecfeff' : '#fef3c7')};
  border: 1px solid ${({ $type }) => ($type === 'group' ? '#a5f3fc' : '#fde68a')};
  border-radius: 999px;
  color: ${({ $type }) => ($type === 'group' ? '#0e7490' : '#92400e')};
  display: inline-flex;
  flex: 0 0 auto;
  height: 30px;
  justify-content: center;
  width: 30px;
`;
