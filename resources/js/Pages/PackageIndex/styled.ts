import styled from 'styled-components';

export const PackageIndexContainer = styled.div`
  display: grid;
  gap: 24px;
`;

export const Heading = styled.div`
  display: grid;
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 28px;
  margin: 0;
`;

export const Description = styled.p`
  color: #64748b;
  margin: 0;
`;

export const Filters = styled.form`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  display: grid;
  gap: 14px;
  grid-template-columns: 2fr repeat(5, minmax(0, 1fr));
  padding: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Input = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 12px;
`;

export const Select = styled.select`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 12px;
`;

export const Button = styled.button`
  background: #2563eb;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 800;
  padding: 11px 14px;
`;

export const Results = styled.div`
  display: grid;
  gap: 14px;
`;

export const PackageCard = styled.article`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  display: grid;
  gap: 12px;
  padding: 18px;
`;

export const PackageHeader = styled.div`
  align-items: start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
`;

export const PackageTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 4px;
`;

export const PackageIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
`;

export const Meta = styled.div`
  color: #64748b;
  font-size: 13px;
`;

export const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Badge = styled.span`
  background: #eef2ff;
  border-radius: 999px;
  color: #3730a3;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
`;

export const AssignmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Empty = styled.div`
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  color: #64748b;
  padding: 24px;
  text-align: center;
`;
