import { ApolloLink } from '@apollo/client';
import {  hasDirectives, Observable } from '@apollo/client/utilities';

export default class SelectiveLink extends ApolloLink {
  typeCache = new Map();
  uri;
  headers;

  constructor({ uri, headers = {} } = {}) {
    super();
    this.uri = uri;
    this.headers = headers;
  }

  isSelectiveDirective = directive => {
    if (!directive) return false;
    const { name } = directive;
    return (name || {}).value === 'selective';
  };

  parseSelectiveDirective = directive => {
    const args = (directive || {})['arguments'] || [];
    const type = ((args.find(arg => (arg.name || {}).value === 'type') || {}).value || {}).value;
    return { type };
  };

  handleDirective = async (directive, selection, parent) => {
    if (!this.isSelectiveDirective(directive)) return;
    const { type } = this.parseSelectiveDirective(directive);
    selection.directives = [];
    if (!type) return;

    const fieldName = this.getFieldName(selection);
    const selections = ((parent || {}).selectionSet || {}).selections || [];

    let cached = this.typeCache.get(type);
    if (!cached) {
      const res = await fetch(this.uri, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({ query: `{ __type(name: "${type}") { fields { name }}}` }),
      });
      const fields = ((((await res.json()) || {}).data || {}).__type || {}).fields || [];
      cached = fields.map(field => (field || {}).name).filter(_ => _);
      this.typeCache.set(type, cached);
    }
    if (!~cached.indexOf(fieldName)) {
      const index = selections.findIndex(_selection => this.getFieldName(_selection) === fieldName);
      selections.splice(index, 1);
    }
  };

  getFieldName = selection => {
    return ((selection || {}).name || {}).value || '';
  }

  handleDirectivesFromSelection = async (selection, parent) => {
    if (!selection) return;
    if (selection.directives && selection.directives.length > 0) {
      await Promise.all(selection.directives.map(directive => this.handleDirective(directive, selection, parent)));
    }
    if (selection.selectionSet && selection.selectionSet.selections) {
      await Promise.all(
        selection.selectionSet.selections.map(_selection => this.handleDirectivesFromSelection(_selection, selection)),
      );
    }
  };

  request = (operation, forward) => {
    let query = operation.query;
    if (hasDirectives(['selective'], query)) {
      return new Observable(observer => {
        let handle;
        let closed = false;
        Promise.resolve(operation)
          .then(() => {
            return Promise.all(query.definitions.map(this.handleDirectivesFromSelection));
          })
          .then(() => {
            if (closed) return;
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch(observer.error.bind(observer));

        return function() {
          closed = true;
          if (handle) handle.unsubscribe();
        };
      });
    }
    return forward ? forward(operation) : null;
  };
}
