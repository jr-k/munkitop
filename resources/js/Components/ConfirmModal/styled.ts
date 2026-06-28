import styled from 'styled-components';

export const Overlay = styled.div`
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgb(15 23 42 / 55%);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 24px;
  position: fixed;
  z-index: 100;
`;

export const Dialog = styled.div`
  background:
    radial-gradient(circle at top left, rgb(254 226 226 / 70%), transparent 34%),
    #ffffff;
  border: 1px solid rgb(255 255 255 / 70%);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgb(15 23 42 / 28%);
  display: grid;
  gap: 18px;
  max-width: 440px;
  padding: 26px;
  width: min(100%, 440px);
`;

export const Icon = styled.div`
  align-items: center;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 18px;
  color: #b91c1c;
  display: flex;
  font-size: 24px;
  font-weight: 900;
  height: 52px;
  justify-content: center;
  width: 52px;
`;

export const Content = styled.div`
  display: grid;
  gap: 8px;
`;

export const Title = styled.h2`
  color: #0f172a;
  font-size: 22px;
  line-height: 1.15;
  margin: 0;
`;

export const Description = styled.p`
  color: #475569;
  line-height: 1.55;
  margin: 0;
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const CancelButton = styled.button`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #334155;
  font-weight: 800;
  padding: 11px 14px;

  &:hover {
    background: #f1f5f9;
  }
`;

export const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #dc2626, #991b1b);
  border: 0;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgb(220 38 38 / 22%);
  color: #ffffff;
  font-weight: 900;
  padding: 11px 16px;

  &:hover {
    filter: brightness(1.04);
  }
`;
