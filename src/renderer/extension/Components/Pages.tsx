import {ExtensionPages} from '../../../cross/ExtensionTypes';

const Pages: ExtensionPages = {};

function HomePage() {
  return <div className="flex size-full items-center justify-center">Home Page Baby!</div>;
}

function ImageGenerationPage() {
  return null;
}

function TextGenerationPage() {
  return null;
}

function AudioGenerationPage() {
  return null;
}

function ModulesPage() {
  return null;
}

function SettingsPage() {
  return null;
}

function DashboardPage() {
  return null;
}

Pages.HomePage = HomePage;
Pages.ImageGenerationPage = ImageGenerationPage;
Pages.TextGenerationPage = TextGenerationPage;
Pages.AudioGenerationPage = AudioGenerationPage;
Pages.ModulesPage = ModulesPage;
Pages.SettingsPage = SettingsPage;
Pages.DashboardPage = DashboardPage;

export default Pages;
