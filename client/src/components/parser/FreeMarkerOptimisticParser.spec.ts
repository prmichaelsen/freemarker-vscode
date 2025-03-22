import { FreeMarkerOptimisticParser } from './FreeMarkerOptimisticParser';
import { FreeMarkerTokenizer } from './FreeMarkerTokenizer';

describe("FreeMarkerOptimisticParser", () => {

  it('parses open close user defined directives', () => {
    const tokenizer = new FreeMarkerTokenizer(`<@core.MyMacro arg1=arg1><span></span></@core.MyMacro>`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(tree).toEqual({
      "elements": [
        {
          "close": {
            "type": ">",
            "value": ">",
          },
          "directive": "core.MyMacro",
          "elements": [
            {
              "close": {
                "type": ">",
                "value": ">",
              },
              "elements": [
                {
                  "type": "string",
                  "value": {
                    "type": "string",
                    "value": " arg1=arg1",
                  },
                },
              ],
              "open": {
                "type": "<@",
                "value": "<@",
              },
              "tag": {
                "type": "core.MyMacro",
                "value": "core.MyMacro",
              },
              "type": "open",
            },
            {
              "type": "string",
              "value": {
                "type": "string",
                "value": `<span></span>`,
              },
            },
            {
              "close": {
                "type": ">",
                "value": ">",
              },
              "open": {
                "type": "</@",
                "value": "</@",
              },
              "tag": {
                "type": "core.MyMacro",
                "value": "core.MyMacro",
              },
              "type": "close",
            },
          ],
          "open": {
            "type": "<@",
            "value": "<@",
          },
          "tag": {
            "type": "core.MyMacro",
            "value": "core.MyMacro",
          },
          "type": "userdefined",
        },
      ],
      "type": "root",
    });
  }, 2000);

  it('parses self closing user defined directives', () => {
    const tokenizer = new FreeMarkerTokenizer(`<@core.MyMacro arg1=arg1/>`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(tree).toEqual({
      "type": "root",
      "elements": [
        {
          "close": {
            "type": "/>",
            "value": "/>",
          },
          "directive": "core.MyMacro",
          "elements": [
            {
              "type": "string",
              "value": {
                "type": "string",
                "value": " arg1=arg1",
              },
            },
          ],
          "open": {
            "type": "<@",
            "value": "<@",
          },
          "selfClosing": true,
          "tag": {
            "type": "core.MyMacro",
            "value": "core.MyMacro",
          },
          "type": "userdefined",
        },
      ],
    });
  }, 2000);


  it('parses open close directive', () => {
    const tokenizer = new FreeMarkerTokenizer(`<#macro MyMacro arg1><span></span></#macro>`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(tree).toEqual({
      "type": "root",
      "elements": [
        {
          type: "directive",
          directive: "macro",
          "close": {
            "type": ">",
            "value": ">",
          },
          "elements": [
            {
              "close": {
                "type": ">",
                "value": ">",
              },
              "elements": [
                {
                  "type": "string",
                  "value": {
                    "type": "string",
                    "value": " MyMacro arg1",
                  },
                },
              ],
              "open": {
                "type": "<#",
                "value": "<#",
              },
              "tag": {
                "type": "macro",
                "value": "macro",
              },
              "type": "open",
            },
            {
              "type": "string",
              "value": {
                "type": "string",
                "value": "<span></span>",
              },
            },
            {
              "close": {
                "type": ">",
                "value": ">",
              },
              "open": {
                "type": "</#",
                "value": "</#",
              },
              "tag": {
                "type": "macro",
                "value": "macro",
              },
              "type": "close",
            },
          ],
          "open": {
            "type": "<#",
            "value": "<#",
          },
          "tag": {
            "type": "macro",
            "value": "macro",
          },
        },
      ],
    });
  }, 2000);

  it('parses self closing directive', () => {
    const tokenizer = new FreeMarkerTokenizer(`<#some_directive arg1/>`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(tree).toEqual({
      "type": "root",
      "elements":
        [
          {
            "close": {
              "type": "/>",
              "value": "/>",
            },
            "directive": "some_directive",
            "elements": [
              {
                "type": "string",
                "value": {
                  "type": "string",
                  "value": " arg1",
                },
              },
            ],
            "open": {
              "type": "<#",
              "value": "<#",
            },
            "selfClosing": true,
            "tag": {
              "type": "some_directive",
              "value": "some_directive",
            },
            "type": "directive",
          },
        ],
    });
  }, 2000);

  it('parses comment', () => {
    const tokenizer = new FreeMarkerTokenizer(`<#-- comment -->`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(tree).toEqual({
      "elements": [
        {
          "close": {
            "type": "-->",
            "value": "-->",
          },
          "elements": [
            {
              "type": "string",
              "value": {
                "type": "string",
                "value": " comment ",
              },
            },
          ],
          "open": {
            "type": "<#--",
            "value": "<#--",
          },
          "selfClosing": true,
          "type": "comment",
        },
      ],
      "type": "root",
    });
  }, 2000);

  it.skip('parses expression', () => {
    const tokenizer = new FreeMarkerTokenizer(`<span>\${myVar}</span>`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(tree).toEqual({
      "elements": [
        {
          "type": "string",
          "value": {
            "type": "string",
            "value": "<span>",
          },
        },
        {
          type: "expression",
          open: {
            type: "${",
            value: "${",
          },
          close: {
            type: "}",
            value: "}",
          },
          elements: [
            {
              type: "string",
              value: { type: "string", value: "myVar" },
            }
          ]
        },
        {
          "type": "string",
          "value": {
            "type": "string",
            "value": "</span>",
          },
        },
      ],
      "type": "root",
    });
  }, 2000);

  it.skip('poorly handles garbage', () => {
    const tokenizer = new FreeMarkerTokenizer(`<# div <@ -->`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(parser.rejected).toEqual([]);
    expect(tree).toEqual({
      "elements": [
        {
          "close": undefined,
          "directive": " div <@ --",
          "elements": [
            {
              "close": {
                "type": ">",
                "value": ">",
              },
              "elements": [],
              "open": {
                "type": "<#",
                "value": "<#",
              },
              "tag": {
                "type": "string",
                "value": " div <@ --",
              },
              "type": "open",
            },
            {
              "close": undefined,
              "open": undefined,
              "tag": {
                "type": "string",
                "value": " div <@ --",
              },
              "type": "close",
            },
          ],
          "open": {
            "type": "<#",
            "value": "<#",
          },
          "tag": {
            "type": "string",
            "value": " div <@ --",
          },
          "type": "directive",
        },
      ],
      "type": "root",
    });
  }, 2000);

  it.skip('unopened var without recursing', () => {
    const tokenizer = new FreeMarkerTokenizer("}");
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(parser.rejected).toEqual([]);
    expect(tree).toEqual({
      "elements": [
        {
          "type": "string",
          "value": {
            "type": "string",
            "value": "}",
          },
        },
      ],
      "type": "root",
    });
  }, 2000);

  it.skip('any unopened without recursing', () => {
    const closeBrace = "}";
    const tokenizer = new FreeMarkerTokenizer(/*html*/`${closeBrace}>--></#</@`);
    const tokens = tokenizer.tokenize(false);
    const parser = new FreeMarkerOptimisticParser(tokens);
    const tree = parser.parse();
    expect(parser.rejected).toEqual([]);
    expect(tree).toEqual({
      "elements": [
        {
          "type": "string",
          "value": {
            "type": "string",
            "value": "}>--></#</@",
          },
        },
      ],
      "type": "root",
    });
  }, 2000);

});