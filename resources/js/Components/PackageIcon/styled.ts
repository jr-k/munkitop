import styled from 'styled-components';

export const IconFrame = styled.span<{ $size: 'sm' | 'md' }>`
  align-items: center;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  border-radius: ${({ $size }) => ($size === 'sm' ? '9px' : '12px')};
  color: #3730a3;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: ${({ $size }) => ($size === 'sm' ? '11px' : '13px')};
  font-weight: 900;
  height: ${({ $size }) => ($size === 'sm' ? '28px' : '36px')};
  justify-content: center;
  overflow: hidden;
  width: ${({ $size }) => ($size === 'sm' ? '28px' : '36px')};
`;

export const IconImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;
