import styled from 'styled-components';

export const LoginContainer = styled.main`
  align-items: center;
  display: grid;
  min-height: 100vh;
  padding: 24px;
`;

export const Panel = styled.form`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgb(15 23 42 / 12%);
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 420px;
  padding: 28px;
  width: 100%;
`;

export const Title = styled.h1`
  font-size: 26px;
  margin: 0;
`;

export const Help = styled.p`
  color: #64748b;
  line-height: 1.5;
  margin: 0;
`;

export const Input = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
`;

export const Button = styled.button`
  background: #2563eb;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 800;
  padding: 12px 16px;
`;
