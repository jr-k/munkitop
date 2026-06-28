import styled from 'styled-components';
import { Link } from '@inertiajs/react';

export const AppLayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  background: #0f172a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: 100vh;
  padding: 22px;
  position: sticky;
  top: 0;

  @media (max-width: 860px) {
    min-height: auto;
    position: static;
  }
`;

export const Navigation = styled.nav`
  display: grid;
  gap: 24px;
`;

export const NavSection = styled.div`
  display: grid;
  gap: 8px;
`;

export const SectionTitle = styled.div`
  color: #94a3b8;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  padding: 0 12px;
  text-transform: uppercase;
`;

export const NavLink = styled(Link)<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? 'rgb(255 255 255 / 16%)' : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? 'rgb(255 255 255 / 16%)' : 'transparent')};
  border-radius: 14px;
  color: #ffffff;
  display: block;
  font-weight: 800;
  padding: 11px 12px;
  text-decoration: none;

  &:hover {
    background: rgb(255 255 255 / 12%);
  }
`;

export const SidebarFooter = styled.div`
  display: grid;
  gap: 12px;
  margin-top: auto;

  @media (max-width: 860px) {
    margin-top: 0;
  }
`;

export const LanguageSwitcher = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

export const LanguageButton = styled.button<{ $active: boolean }>`
  align-items: center;
  background: ${({ $active }) => ($active ? 'rgb(255 255 255 / 14%)' : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? 'rgb(255 255 255 / 16%)' : 'transparent')};
  border-radius: 999px;
  color: ${({ $active }) => ($active ? '#ffffff' : '#94a3b8')};
  display: inline-flex;
  font-size: 12px;
  font-weight: 900;
  gap: 5px;
  padding: 6px 8px;

  &:hover {
    background: rgb(255 255 255 / 10%);
    color: #ffffff;
  }
`;

export const ProjectMeta = styled.div`
  align-items: center;
  color: #64748b;
  display: flex;
  font-size: 12px;
  font-weight: 800;
  justify-content: flex-start;
  padding: 0 2px;
`;

export const GitHubLink = styled.a`
  align-items: center;
  color: #94a3b8;
  display: inline-flex;
  gap: 7px;
  text-decoration: none;

  &:hover {
    color: #ffffff;
  }
`;

export const Brand = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;

  svg {
    flex: 0 0 auto;
  }
`;

export const Title = styled.h1`
  font-size: 20px;
  line-height: 1.1;
  margin: 0;
`;

export const Subtitle = styled.span`
  color: #cbd5e1;
  font-size: 13px;
`;

export const Main = styled.main`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px;
  width: 100%;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

export const UserFooter = styled.div`
  align-items: center;
  border-top: 1px solid rgb(255 255 255 / 12%);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-top: 12px;
`;

export const SignedIn = styled.span`
  color: #94a3b8;
  display: grid;
  gap: 2px;
  font-size: 12px;
  line-height: 1.35;
  min-width: 0;
`;

export const SignedInEmail = styled.span`
  color: #ffffff;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LogoutButton = styled.button`
  align-items: center;
  background: rgb(255 255 255 / 10%);
  border: 0;
  border-radius: 10px;
  color: #cbd5e1;
  display: inline-flex;
  flex: 0 0 auto;
  height: 36px;
  justify-content: center;
  padding: 0;
  width: 36px;

  &:hover {
    background: rgb(255 255 255 / 16%);
    color: #ffffff;
  }
`;
