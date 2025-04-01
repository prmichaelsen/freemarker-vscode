import { FreeMarkerTokenizer } from "./FreeMarkerTokenizer";
import { expressionClose, string } from './grammar';

describe('FreeMarkerTokenizer', () => {
  describe("tokenizer", () => {
    it('basic tokenizer 1', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
        <script type="text/javascript">
          <#if deviceType == "MOBILE">
              alert("Mobile");
          <#else>
              alert("Desktop");
          </#if>
        </script>
      `);
      const tokens = tokenizer.tokenize({ index: false, ignoreWhitespace: true });
      expect(tokens).toEqual([
        { type: string, value: `` },
        { type: "<", value: "<" },
        { type: "script", value: `script` },
        { type: "string", value: `type="text/javascript"` },
        { type: ">", value: ">" },
        { type: string, value: `` },
        { type: `<#`, value: `<#` },
        { type: `if`, value: `if` },
        {
          type: `string`,
          value: `deviceType == \"MOBILE\"`,
        },
        { type: `>`, value: `>` },
        { type: string, value: `alert("Mobile");` },
        { type: `<#`, value: `<#` },
        { type: `else`, value: `else` },
        { type: `>`, value: `>` },
        { type: string, value: `alert("Desktop");` },
        { type: `</#`, value: `</#` },
        { type: `if`, value: `if` },
        { type: `>`, value: `>` },
        { type: string, value: `` },
        { type: "</", value: "</" },
        { type: "script", value: `script` },
        { type: ">", value: ">" },
        { type: string, value: `` },
      ]);
    });

    it('basic tokenizer 2', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
          <#if deviceType == "MOBILE">
            <div></div>
          </#if>
      `);
      const tokens = tokenizer.tokenize({ index: false, ignoreWhitespace: true });
      expect(tokens).toEqual([
        { type: `string`, value: `` },
        { type: `<#`, value: `<#` },
        { type: `if`, value: `if` },
        {
          type: `string`,
          value: `deviceType == \"MOBILE\"`,
        },
        { type: `>`, value: `>` },
        { type: `string`, value: `` },
        { type: "<", value: "<" },
        { type: "div", value: "div" },
        { type: ">", value: ">" },
        { type: "</", value: "</" },
        { type: "div", value: "div" },
        { type: ">", value: ">" },
        { type: `string`, value: `` },
        { type: `</#`, value: `</#` },
        { type: `if`, value: `if` },
        { type: `>`, value: `>` },
        { type: `string`, value: `` },
      ]);
    });

    it('handles self closing ftl tags', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<#nested/>`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<#`, value: `<#` },
        { type: `nested`, value: `nested` },
        { type: `/>`, value: `/>` },
      ]);
    });

    it('handles self closing macro tags', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<@MyMacro/>`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<@`, value: `<@` },
        { type: `MyMacro`, value: `MyMacro` },
        { type: `/>`, value: `/>` },
      ]);
    });

    it('self closing tags', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<#nested/><@MyMacro/>`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<#`, value: `<#` },
        { type: `nested`, value: `nested` },
        { type: `/>`, value: `/>` },
        { type: `<@`, value: `<@` },
        { type: `MyMacro`, value: `MyMacro` },
        { type: `/>`, value: `/>` },
      ]);
    });



    it('handles vars in tag', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<@aui.list cssClass="gc-option-swatch-list \${orientationClass}"></@aui.list>`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<@`, value: `<@` },
        { type: `aui.list`, value: `aui.list` },
        {
          type: `string`,
          value: ` cssClass="gc-option-swatch-list \${orientationClass}"`,
        },
        { type: `>`, value: `>` },
        { type: `</@`, value: `</@` },
        { type: `aui.list`, value: `aui.list` },
        { type: `>`, value: `>` },
      ]);
    });


    it('basic tokenizer 3', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
          <@MyMacro arg1=arg1 arg2=arg2>
          </@MyMacro>
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
          ` },
        { type: "<@", value: "<@" },
        { type: "MyMacro", value: "MyMacro" },
        { type: "string", value: " arg1=arg1 arg2=arg2" },
        { type: ">", value: ">" },
        { type: string, value: `
          ` },
        { type: "</@", value: "</@" },
        { type: "MyMacro", value: "MyMacro" },
        { type: ">", value: ">" },
        { type: string, value: `
      ` },
      ]);
    });

    it('tokenizes inline args', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
          <@MyMacro arg1=arg1 ; arg2>
          </@MyMacro>
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
          ` },
        { type: "<@", value: "<@" },
        { type: "MyMacro", value: "MyMacro" },
        { type: "string", value: " arg1=arg1 ; arg2" },
        { type: ">", value: ">" },
        { type: string, value: `
          ` },
        { type: "</@", value: "</@" },
        { type: "MyMacro", value: "MyMacro" },
        { type: ">", value: ">" },
        { type: string, value: `
      ` },
      ]);
    });


    it('basic tokenizer 4', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
          <@MyMacro>
          </@MyMacro>
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
          ` },
        { type: "<@", value: "<@" },
        { type: "MyMacro", value: "MyMacro" },
        { type: ">", value: ">" },
        { type: string, value: `
          ` },
        { type: "</@", value: "</@" },
        { type: "MyMacro", value: "MyMacro" },
        { type: ">", value: ">" },
        { type: string, value: `
      ` },
      ]);
    });

    it.skip('basic tokenizer 5', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
        <div>\${var}</div>
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
        <div>` },
        { type: "${", value: "${" },
        { type: "string", value: "var" },
        { type: "}", value: "}" },
        { type: string, value: `</div>
      ` },
      ]);
    });

    it('basic tokenizer 6', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
        Text 1
        <#-- comment -->
        Text 2
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
        Text 1
        ` },
        { type: "<#--", value: "<#--" },
        { type: string, value: " comment " },
        { type: "-->", value: "-->" },
        { type: string, value: `
        Text 2
      ` },
      ]);
    });

    it('basic tokenizer 7', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
          <#if deviceType == "MOBILE">
            <div></div>
          <#else>
            <span></span>
          </#if>
      `);
      const tokens = tokenizer.tokenize({ index: false, ignoreWhitespace: true });
      expect(tokens).toEqual([
        { type: `string`, value: `` },
        { type: `<#`, value: `<#` },
        { type: `if`, value: `if` },
        {
          type: `string`,
          value: `deviceType == \"MOBILE\"`,
        },
        { type: `>`, value: `>` },
        { type: `string`, value: `` },
        { type: "<", value: "<" },
        { type: "div", value: "div" },
        { type: ">", value: ">" },
        { type: "</", value: "</" },
        { type: "div", value: "div" },
        { type: ">", value: ">" },
        { type: `string`, value: `` },
        { type: `<#`, value: `<#` },
        { type: `else`, value: `else` },
        { type: `>`, value: `>` },
        { type: `string`, value: `` },
        { type: "<", value: "<" },
        { type: "span", value: "span" },
        { type: ">", value: ">" },
        { type: "</", value: "</" },
        { type: "span", value: "span" },
        { type: ">", value: ">" },
        { type: `string`, value: `` },
        { type: `</#`, value: `</#` },
        { type: `if`, value: `if` },
        { type: `>`, value: `>` },
        { type: `string`, value: `` },
      ]);
    });

    it('basic tokenizer 8', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
          <#if deviceType == "MOBILE">
            <div id="id1">
          <#else>
            <div id="id2">
          </#if>
              Text 1
            </div>
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
          ` },
        { type: "<#", value: "<#" },
        { type: "if", value: "if" },
        { type: "string", value: " deviceType == \"MOBILE\"" },
        { type: ">", value: ">" },
        { type: "string", value: `
            `
        },
        { type: "<", value: "<" },
        { type: "div", value: "div" },
        { type: "string", value: ` id="id1"` },
        { type: ">", value: ">" },
        { type: "string", value: `
          `
        },
        { type: "<#", value: "<#" },
        { type: "else", value: "else" },
        { type: ">", value: ">" },
        { type: "string", value: `
            `
        },
        { type: "<", value: "<" },
        { type: "div", value: "div" },
        { type: "string", value: ` id="id2"` },
        { type: ">", value: ">" },
        { type: "string", value: `
          `
        },
        { type: "</#", value: "</#" },
        { type: "if", value: "if" },
        { type: ">", value: ">" },
        { type: "string", value: `
              Text 1
            ` },
        { type: "</", value: "</" },
        { type: "div", value: "div" },
        { type: ">", value: ">" },
        { type: "string", value: `
      `
        },
      ]);
    });

    it.skip('basic tokenizer 9', () => {
      const expression = "(isRequired)?then('true', 'false}')"
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
        <fieldset 
          aria-required="\${${expression}}"
        ></fieldset>
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
        <fieldset 
          aria-required="` },
        { type: "${", value: "${" },
        { type: string, value: expression },
        { type: "}", value: "}" },
        { type: string, value: `"
        ></fieldset>
      ` },
      ]);
    });

    it('handles unknown ftl tags', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<#foo></#bar>`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<#`, value: `<#` },
        { type: `foo`, value: `foo` },
        { type: `>`, value: `>` },
        { type: `</#`, value: `</#` },
        { type: `bar`, value: `bar` },
        { type: `>`, value: `>` },
      ]);
    });

    it('tags with spaces', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<#tag ></#tag >`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<#`, value: `<#` },
        { type: `tag`, value: `tag` },
        { type: string, value: ` ` },
        { type: `>`, value: `>` },
        { type: `</#`, value: `</#` },
        { type: `tag`, value: `tag` },
        { type: string, value: ` ` },
        { type: `>`, value: `>` },
      ]);
    });

    it('ignores tags starting with .', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<#.tag></#.tag>`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<#`, value: `<#` },
        { type: string, value: `.tag` },
        { type: `>`, value: `>` },
        { type: `</#`, value: `</#` },
        { type: string, value: `.tag` },
        { type: `>`, value: `>` },
      ]);
    });

    it('tags with .', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`<#namespace.tag></#namespace.tag>`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: `<#`, value: `<#` },
        { type: `namespace.tag`, value: `namespace.tag` },
        { type: `>`, value: `>` },
        { type: `</#`, value: `</#` },
        { type: `namespace.tag`, value: `namespace.tag` },
        { type: `>`, value: `>` },
      ]);
    });


    it('handles garbage without recursing infinitely', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
        <#
          div
            <@
        -->
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `
        ` },
        { type: `<#`, value: `<#` },
        { type: string, value: `
          div
            <@
        --` },
        { type: `>`, value: `>` },
        { type: string, value: `
      ` },
      ]);
    });

    it('unopened var without recursing', () => {
      const tokenizer = new FreeMarkerTokenizer(expressionClose);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: "}" }, 
      ]);
    });

    it.skip('any unopened without recursing', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`${expressionClose}>--></#</@`);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        { type: string, value: `${expressionClose}>--></#</@` }, 
      ]);
    });

    it('reads html tag', () => {
      const tokenizer = new FreeMarkerTokenizer(/*html*/`
        <span></span>
      `);
      const tokens = tokenizer.tokenize({ index: false });
      expect(tokens).toEqual([
        {
          type: string, value: `
        `,
        },
        {
          type: "<",
          value: "<",
        },
        {
          type: "span",
          value: "span",
        },
        {
          type: ">",
          value: ">",
        },
        {
          type: "</",
          value: "</",
        },
        {
          type: "span",
          value: "span",
        },
        {
          type: ">",
          value: ">",
        },
        {
          type: "string",
          value: `
      `,
          }
      ]);
    });

  });
});



