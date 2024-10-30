import {RunningAIComponent} from '../../../cross/ExtensionTypes';

const RunningAI: RunningAIComponent = {};

function Container() {
  return null;
}

function Terminal() {
  return null;
}

function Browser() {
  return null;
}

// !Important → Remove any unused Component from the below object

RunningAI.Container = Container;
RunningAI.Terminal = Terminal;
RunningAI.Browser = Browser;

export default RunningAI;
