import {CustomizeHomePageComponent} from '../../../../cross/ExtensionTypes';

const CustomizeHomePage: CustomizeHomePageComponent = {};

function AddToTop() {
  return <div className="h-24 w-full shrink-0 bg-blue-700" />;
}

function AddToBottom() {
  return <div className="h-24 w-full shrink-0 bg-purple-700" />;
}

function AddToScroll_Top() {
  return <div className="h-24 w-full shrink-0 bg-red-700" />;
}

function AddToScroll_Bottom() {
  return <div className="h-24 w-full shrink-0 bg-green-700" />;
}

function ReplaceSearchAndFilter() {
  return (
    <div className="h-16 w-full content-center bg-success text-center">I&#39;m Search Box and also Filter Button</div>
  );
}

function ReplaceCategories() {
  return (
    <div className="h-64 w-full content-center bg-secondary text-center">
      I&#39;m A category that contain something i don&#39;t know
    </div>
  );
}

// !Important → Remove any unused Component from the below object
CustomizeHomePage.AddToTop = AddToTop;
CustomizeHomePage.AddToBottom = AddToBottom;
CustomizeHomePage.AddToScroll_Top = AddToScroll_Top;
CustomizeHomePage.AddToScroll_Bottom = AddToScroll_Bottom;
CustomizeHomePage.ReplaceSearchAndFilter = ReplaceSearchAndFilter;
CustomizeHomePage.ReplaceCategories = ReplaceCategories;

export default CustomizeHomePage;
