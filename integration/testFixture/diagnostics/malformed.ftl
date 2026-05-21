<#-- malformed FTL fixture — exists for future Phase 2 diagnostics work.
     Not asserted against today; kept as a known-bad shape for the
     diagnostics test suite to grow into. -->
<#if user.active>
  ${user.name?upper_case
  <#list items as item
    ${item}
  </#lst>
