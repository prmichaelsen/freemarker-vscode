<#if user.active>
Hello, ${user.name?upper_case}!
The list has ${items?size} entries.
</#if>
