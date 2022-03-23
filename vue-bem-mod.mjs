const { B: BemCompilerLib } = require('b_');
const find = require('lodash.find');
const noop = require('lodash.noop');

const defaultBemCompiler = BemCompilerLib();

function processChildrenWithBem(children, { bemBlock: parentBemBlock, bemComponentCall } = {}) {
  children.forEach((child) => {
    let newBemBlock;
    let bemElem;
    let bemMods;

    if (child.data && child.data.__directBemComponentChild) return;

    if (bemComponentCall) {
      child.data = child.data || {};
      child.data.__directBemComponentChild = true;
    }

    if (child.data) {
      if (child.data.directives) {
        const { arg, value, modifiers } = find(child.data.directives, { name: 'bem-block' }) || {}; // expression,
        newBemBlock = arg; // || value || expression;
        // if (arg && value) bemMods = { ...value, ...modifiers };
        if (newBemBlock) bemMods = { ...modifiers, ...value };
      }

      if (child.data.directives) {
        const { arg, value, modifiers } = find(child.data.directives, { name: 'bem-elem' }) || {}; // expression,
        bemElem = arg; //  || value || expression;
        // if (arg && value) bemMods = { ...bemMods, ...value, ...modifiers };
        // bemMods = { ...bemMods, ...modifiers };
        if (bemElem) bemMods = { ...bemMods, ...modifiers, ...value };
      }

      // TODO Сделать чтото чтоб бем два раза не добавлял классы если бем уже посчитан...

      if (bemElem) {
        child.data = child.data || {};
        child.data.staticClass = child.data.staticClass || '';
        if (child.data.staticClass) child.data.staticClass += ' ';
        child.data.staticClass = child.data.staticClass + defaultBemCompiler(newBemBlock || parentBemBlock, bemElem, bemMods);
      }

      if (newBemBlock && !bemElem) {
        child.data = child.data || {};
        child.data.staticClass = child.data.staticClass || '';
        if (child.data.staticClass) child.data.staticClass += ' ';
        child.data.staticClass = child.data.staticClass + defaultBemCompiler(newBemBlock, null, bemMods);
      }
    }

    if (child.children) {
      return processChildrenWithBem(
        child.children,
        { bemBlock: newBemBlock || parentBemBlock }
      );
    }

    if (child.componentOptions && child.componentOptions.children) {
      return processChildrenWithBem(
        child.componentOptions.children,
        { bemBlock: newBemBlock || parentBemBlock }
      );
    }
  });
}

function install(Vue) {
  Vue.component('bem', {
    functional: true,
    render(_, { children, data: { directives } = {} } = {}) {
      let bemBlock;

      if (directives) {
        const { arg, value, expression } = find(directives, { name: 'bem-block' }) || {};
        bemBlock = arg || value || expression;
      }

      if (children) {
        processChildrenWithBem(
          children,
          { bemBlock, bemComponentCall: true }
        );
      }

      return children;
    }
  });


  Vue.directive('bem-block', noop);
  Vue.directive('bem-elem', noop);
}

module.exports = {
  install
}

/* Vue.config.optionMergeStrategies.render = (parentVal, childVal) => {
  console.log(parentVal, childVal);
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  if (parentVal && childVal) {
    // if (parentVal && childVal) {
    return function render(...args) {
      args.push([childVal.apply(this, args)]);
      return parentVal.apply(this, args);
    };

    // return mergedParentVal;
    // }

    // return childVal;
  }
}; */
