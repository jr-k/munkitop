import styled from 'styled-components';
import { Link } from '@inertiajs/react';

export const AppLayoutContainer = styled.div`
  min-height: 100vh;
`;

export const Header = styled.header`
  align-items: center;
  background: #111827;
  color: #ffffff;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 18px 32px;

  @media (max-width: 900px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const HeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const NavLink = styled(Link)`
  background: rgb(255 255 255 / 12%);
  border-radius: 999px;
  color: #ffffff;
  font-weight: 700;
  padding: 10px 14px;
  text-decoration: none;

  &:hover {
    background: rgb(255 255 255 / 18%);
  }
`;

export const LanguageSelect = styled.select`
  background: rgb(255 255 255 / 12%);
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  font-weight: 800;
  padding: 10px 12px;

  option {
    color: #111827;
  }
`;

export const Brand = styled.div`
  display: grid;
  gap: 2px;
`;

export const Title = styled.h1`
  font-size: 20px;
  margin: 0;
`;

export const Subtitle = styled.span`
  color: #cbd5e1;
  font-size: 13px;
`;

export const Main = styled.main`
  display: grid;
  gap: 24px;
  padding: 28px;
  width: 100%;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

export const LogoutButton = styled.button`
  background: #ffffff;
  border: 0;
  border-radius: 999px;
  color: #111827;
  font-weight: 700;
  padding: 10px 16px;
`;
