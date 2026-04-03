import { describe, expect, it } from 'vitest';

import * as corrections from '@analistas/corrections/index.js';
import { analistaPython } from '@analistas/plugins/analista-python.js';
import { analistaReact } from '@analistas/plugins/analista-react.js';
import { analistaReactHooks } from '@analistas/plugins/analista-react-hooks.js';
import { detectarArquetipoNode } from '@analistas/plugins/detector-node.js';
import * as typeSafety from '@analistas/corrections/type-safety/index.js';

describe('exports de analistas', () => {
  it('expoe agregadores e plugins esperados', () => {
    expect(corrections.analistaCorrecaoAutomatica).toBeDefined();
    expect(analistaReact).toBeDefined();
    expect(analistaReactHooks).toBeDefined();
    expect(analistaPython).toBeDefined();
    expect(detectarArquetipoNode).toBeDefined();
  });

  it('expoe utilitarios de type safety', () => {
    expect(typeSafety.extractVariableName).toBeTypeOf('function');
    expect(typeSafety.isInStringOrComment).toBeTypeOf('function');
    expect(typeSafety.categorizarUnknown).toBeTypeOf('function');
  });
});
