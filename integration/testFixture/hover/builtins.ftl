<#-- coverage fixture for builtin hover assertions -->
<#-- string builtins -->
${name?upper_case}
${name?lower_case}
${name?cap_first}
${name?uncap_first}
${name?capitalize}
${name?trim}
${name?length}
${name?index_of("x")}
${name?last_index_of("x")}
${name?contains("x")}
${name?starts_with("x")}
${name?ends_with("x")}
${name?replace("a","b")}
${name?matches("re")}
${name?split(",")}
${name?substring(0,3)}
${name?left_pad(10)}
${name?right_pad(10)}
${name?word_list}
${name?html}
${name?xhtml}
${name?xml}
${name?js_string}
${name?json_string}
${name?url}
${name?url_path}
${name?number}
${name?boolean}
<#-- sequence builtins -->
${items?size}
${items?first}
${items?last}
${items?reverse}
${items?sort}
${items?sort_by("n")}
${items?seq_contains(1)}
${items?seq_index_of(1)}
${items?seq_last_index_of(1)}
${items?join(",")}
<#-- hash builtins -->
${user?keys}
${user?values}
<#-- numeric builtins -->
${n?abs}
${n?round}
${n?floor}
${n?ceiling}
<#-- date builtins -->
${d?date}
${d?time}
${d?datetime}
${d?iso_utc}
<#-- meta builtins -->
${x?is_string}
${x?has_content}
${x?default("fallback")}
${x?exists}
