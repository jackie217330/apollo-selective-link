'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require('@apollo/client');

var _utilities = require('@apollo/client/utilities');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SelectiveLink = function (_ApolloLink) {
  _inherits(SelectiveLink, _ApolloLink);

  function SelectiveLink() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var uri = _ref.uri;
    var _ref$headers = _ref.headers;
    var headers = _ref$headers === undefined ? {} : _ref$headers;

    _classCallCheck(this, SelectiveLink);

    var _this = _possibleConstructorReturn(this, (SelectiveLink.__proto__ || Object.getPrototypeOf(SelectiveLink)).call(this));

    _this.typeCache = new Map();
    _this.uri = uri;
    _this.headers = headers;
    return _this;
  }

  _createClass(SelectiveLink, [{
    key: 'isSelectiveDirective',
    value: function isSelectiveDirective(directive) {
      if (!directive) return false;
      var name = directive.name;

      return (name || {}).value === 'selective';
    }
  }, {
    key: 'parseSelectiveDirective',
    value: function parseSelectiveDirective(directive) {
      var args = (directive || {})['arguments'] || [];
      var type = ((args.find(function (arg) {
        return (arg.name || {}).value === 'type';
      }) || {}).value || {}).value;
      return { type: type };
    }
  }, {
    key: 'handleDirective',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(directive, selection, parent) {
        var _parseSelectiveDirect, type, fieldName, selections, cached, res, fields, index, getFieldName;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                getFieldName = function getFieldName(selection) {
                  return ((selection || {}).name || {}).value || '';
                };

                if (this.isSelectiveDirective.bind(this)(directive)) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt('return');

              case 3:
                _parseSelectiveDirect = this.parseSelectiveDirective.bind(this)(directive);
                type = _parseSelectiveDirect.type;

                selection.directives = [];

                if (type) {
                  _context.next = 8;
                  break;
                }

                return _context.abrupt('return');

              case 8:
                fieldName = getFieldName(selection);
                selections = ((parent || {}).selectionSet || {}).selections || [];
                cached = this.typeCache.get(type);

                if (cached) {
                  _context.next = 32;
                  break;
                }

                _context.next = 14;
                return fetch(this.uri, {
                  method: 'POST',
                  headers: _extends({
                    'content-type': 'application/json'
                  }, this.headers),
                  body: JSON.stringify({ query: '{ __type(name: "' + type + '") { fields { name }}}' })
                });

              case 14:
                res = _context.sent;
                _context.next = 17;
                return res.json();

              case 17:
                _context.t3 = _context.sent;

                if (_context.t3) {
                  _context.next = 20;
                  break;
                }

                _context.t3 = {};

              case 20:
                _context.t2 = _context.t3.data;

                if (_context.t2) {
                  _context.next = 23;
                  break;
                }

                _context.t2 = {};

              case 23:
                _context.t1 = _context.t2.__type;

                if (_context.t1) {
                  _context.next = 26;
                  break;
                }

                _context.t1 = {};

              case 26:
                _context.t0 = _context.t1.fields;

                if (_context.t0) {
                  _context.next = 29;
                  break;
                }

                _context.t0 = [];

              case 29:
                fields = _context.t0;

                cached = fields.map(function (field) {
                  return (field || {}).name;
                }).filter(function (_) {
                  return _;
                });
                this.typeCache.set(type, cached);

              case 32:
                if (!~cached.indexOf(fieldName)) {
                  index = selections.findIndex(function (_selection) {
                    return getFieldName(_selection) === fieldName;
                  });

                  selections.splice(index, 1);
                }

              case 33:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function handleDirective(_x2, _x3, _x4) {
        return ref.apply(this, arguments);
      }

      return handleDirective;
    }()
  }, {
    key: 'handleDirectivesFromSelection',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(selection, parent) {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (selection) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return');

              case 2:
                if (!(selection.directives && selection.directives.length > 0)) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 5;
                return Promise.all(selection.directives.map(function (directive) {
                  return _this2.handleDirective.bind(_this2)(directive, selection, parent);
                }));

              case 5:
                if (!(selection.selectionSet && selection.selectionSet.selections)) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 8;
                return Promise.all(selection.selectionSet.selections.map(function (_selection) {
                  return _this2.handleDirectivesFromSelection.bind(_this2)(_selection, selection);
                }));

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function handleDirectivesFromSelection(_x5, _x6) {
        return ref.apply(this, arguments);
      }

      return handleDirectivesFromSelection;
    }()
  }, {
    key: 'request',
    value: function request(operation, forward) {
      var _this3 = this;

      var query = operation.query;
      if ((0, _utilities.hasDirectives)(['selective'], query)) {
        return new _utilities.Observable(function (observer) {
          var handle = void 0;
          var closed = false;
          Promise.resolve(operation).then(function () {
            return Promise.all(query.definitions.map(_this3.handleDirectivesFromSelection.bind(_this3)));
          }).then(function () {
            if (closed) return;
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            });
          }).catch(observer.error.bind(observer));

          return function () {
            closed = true;
            if (handle) handle.unsubscribe();
          };
        });
      }
      return forward ? forward(operation) : null;
    }
  }]);

  return SelectiveLink;
}(_client.ApolloLink);

exports.default = SelectiveLink;
