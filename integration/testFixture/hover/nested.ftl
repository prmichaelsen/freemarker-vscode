<#-- nested directives: macro contains if contains list -->
<#macro renderUsers users title>
  <h2>${title?upper_case}</h2>
  <#if users?has_content>
    <ul>
      <#list users as u>
        <li>${u.name?cap_first} (${u.email?html})</li>
      </#list>
    </ul>
  <#else>
    <p>No users.</p>
  </#if>
</#macro>

<#-- attempt around list with continue -->
<#attempt>
  <#list rows as row>
    <#if row.skip>
      <#continue>
    </#if>
    ${row.id?string}
  </#list>
<#recover>
  oops
</#attempt>
