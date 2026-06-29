import styled from 'styled-components';

export const PaginationBar = styled.div`
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 12px;
`;

export const Meta = styled.span`
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
`;

export const Controls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const LimitLabel = styled.label`
  align-items: center;
  color: #334155;
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  gap: 8px;
`;

export const Select = styled.select`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #0f172a;
  padding: 7px 10px;
`;

export const PageButton = styled.button`
  align-items: center;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  display: inline-flex;
  font-size: 18px;
  font-weight: 800;
  height: 34px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  width: 34px;

  &:hover:not(:disabled) {
    background: #e2e8f0;
    color: #0f172a;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;
