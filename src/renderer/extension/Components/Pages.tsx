import {ExtensionPages} from '../../../cross/ExtensionTypes';
import Page from '../../src/App/Components/Pages/Page';

const Pages: ExtensionPages = {};

function HomePage() {
  return <Page className="flex size-full items-center justify-center text-4xl text-pink-600">Home Page Baby!</Page>;
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
