import pkg from '../package.json';
const options = {};
const tailSpace = options.tailSpace || '';
const elementSeparator = options.elementSeparator || '__';
const modSeparator = options.modSeparator || '_';
const modValueSeparator = options.modValueSeparator || '_';
const classSeparator = options.classSeparator || ' ';
const isFullModifier = typeof options.isFullModifier === 'undefined' ? true : options.isFullModifier;
const isFullBoolValue = typeof options.isFullBoolValue === 'undefined' ? false : options.isFullBoolValue;
const DirectBemChildSymbol = Symbol('direct bem child');
export const meta = pkg;
export function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('bem', {
    functional: true,

    render(_, vNode) {
      var _vNode$data;

      let bemBlock;
      const directives = vNode === null || vNode === void 0 || (_vNode$data = vNode.data) === null || _vNode$data === void 0 ? void 0 : _vNode$data.directives;
      const children = vNode === null || vNode === void 0 ? void 0 : vNode.children;

      if (directives) {
        const {
          arg,
          value,
          expression
        } = findByObjMatch(directives, {
          name: 'bem-block'
        }) || {};
        bemBlock = arg || value || expression;
      }

      if (children) {
        processChildrenWithBem(children, {
          bemBlock,
          bemComponentCall: true
        });
      }

      return children;
    }

  });
  Vue.directive('bem-block', () => undefined);
  Vue.directive('bem-elem', () => undefined);
}

function processChildrenWithBem(children) {
  let {
    bemBlock: parentBemBlock,
    bemComponentCall
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  children.forEach(child => {
    let newBemBlock;
    let bemElem;
    let bemMods;
    if (child.data && child.data[DirectBemChildSymbol]) return;

    if (bemComponentCall) {
      child.data = child.data || {};
      child.data[DirectBemChildSymbol] = true;
    }

    if (child.data) {
      if (child.data.directives) {
        // const { arg, value, modifiers } = findByObjMatch(child.data.directives, { name: 'bem-block' }) || {}; // expression,
        const indexBemBlock = child.data.directives.findIndex(it => it.name === 'bem-block'); // expression,

        if (indexBemBlock >= 0) {
          const {
            arg,
            value,
            modifiers
          } = child.data.directives[indexBemBlock];
          child.data.directives.splice(indexBemBlock, 1);
          newBemBlock = arg; // || value || expression;
          // if (arg && value) bemMods = { ...value, ...modifiers };

          if (newBemBlock) bemMods = { ...modifiers,
            ...value
          };
        }
      }

      if (child.data.directives) {
        // const { arg, value, modifiers } = findByObjMatch(child.data.directives, { name: 'bem-elem' }) || {}; // expression,
        const indexBemElem = child.data.directives.findIndex(it => it.name === 'bem-elem'); // expression,

        if (indexBemElem >= 0) {
          const {
            arg,
            value,
            modifiers
          } = child.data.directives[indexBemElem];
          child.data.directives.splice(indexBemElem, 1);
          bemElem = arg; //  || value || expression;
          // if (arg && value) bemMods = { ...bemMods, ...value, ...modifiers };
          // bemMods = { ...bemMods, ...modifiers };

          if (bemElem) bemMods = { ...bemMods,
            ...modifiers,
            ...value
          };
        }
      } // TODO Сделать чтото чтоб бем два раза не добавлял классы если бем уже посчитан...


      if (bemElem) {
        child.data = child.data || {};
        child.data.staticClass = child.data.staticClass || '';
        if (child.data.staticClass) child.data.staticClass += ' ';
        child.data.staticClass = child.data.staticClass + BEM(newBemBlock || parentBemBlock, bemElem, bemMods);
      }

      if (newBemBlock && !bemElem) {
        child.data = child.data || {};
        child.data.staticClass = child.data.staticClass || '';
        if (child.data.staticClass) child.data.staticClass += ' ';
        child.data.staticClass = child.data.staticClass + BEM(newBemBlock, null, bemMods);
      }
    }

    if (child.children) {
      processChildrenWithBem(child.children, {
        bemBlock: newBemBlock || parentBemBlock
      });
    }

    if (child.componentOptions && child.componentOptions.children) {
      processChildrenWithBem(child.componentOptions.children, {
        bemBlock: newBemBlock || parentBemBlock
      });
    }
  });
}

function findByObjMatch(arrOfObj, needle) {
  if (!Array.isArray(arrOfObj)) return;
  const keys = Object.keys(needle);

  for (let inspected of arrOfObj) {
    if (!inspected) continue;
    if (typeof inspected !== 'object') continue;
    if (keys.every(key => inspected[key] === needle[key])) return inspected;
  }
}

function _stringifyModifier(base, modifierKey, modifierValue) {
  var result = ''; // Ignore undefined values

  if (typeof modifierValue === 'undefined') {
    return result;
  } // If not using full bools ignore false values


  if (!isFullBoolValue && modifierValue === false) {
    return result;
  } // Makes block__elem_{modifierKey}


  result += classSeparator + base + modSeparator + modifierKey; // If not using full bools skip true `modifierValue`

  if (isFullBoolValue || modifierValue !== true) {
    // Makes block__elem_{modifierKey}_{modifierValue}
    result += modValueSeparator + String(modifierValue);
  }

  return result;
}

function _stringifyModifiers(base, modifiers) {
  var result = '';

  if (!isFullModifier) {
    base = '';
  }

  for (var modifierKey in modifiers) {
    if (!modifiers.hasOwnProperty(modifierKey)) {
      continue;
    }

    result += _stringifyModifier(base, modifierKey, modifiers[modifierKey]);
  }

  return result;
}

function BEM(block, element, modifiers) {
  var className = String(block); // case b_(block, modifiers)

  if (element && typeof element === 'object' && typeof modifiers === 'undefined') {
    modifiers = element;
    element = null;
  }

  if (element) {
    className += elementSeparator + String(element);
  }

  if (modifiers) {
    className += _stringifyModifiers(className, modifiers);
  }

  return className + tailSpace;
}

export default {
  install
};