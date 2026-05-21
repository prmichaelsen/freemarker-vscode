<#-- mixed FTL + HTML — directives interleaved with markup -->
<div class="card">
  <header>
    <h2>${title?upper_case}</h2>
    <#if subtitle?has_content>
      <p class="subtitle">${subtitle?html}</p>
    </#if>
  </header>
  <ul>
    <#list tags as tag>
      <li class="tag">#${tag?lower_case}</li>
    </#list>
  </ul>
</div>
