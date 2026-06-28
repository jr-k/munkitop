import styled from 'styled-components';

export const DashboardContainer = styled.div`
  display: grid;
  gap: 24px;
`;

export const Grid = styled.div`
  align-items: start;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const Wide = styled.div`
  grid-column: 1 / -1;
`;
