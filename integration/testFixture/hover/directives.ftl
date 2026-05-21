<#-- coverage fixture for directive hover assertions -->
<#assign greeting = "hello">
<#local helper = 1>
<#global counter = 0>
<#list items as item>
  ${item}
<#continue>
</#list>
<#macro greet name>
  Hello ${name}!
  <#nested>
</#macro>
<#function double n>
<#return n * 2>
</#function>
<#if x>
  yes
<#elseif y>
  maybe
<#else>
  no
</#if>
<#switch x>
<#case 1>
  one
<#break>
<#default>
  other
</#switch>
<#attempt>
  risky
<#recover>
  safe
</#attempt>
<#import "lib.ftl" as lib>
<#include "header.ftl">
<#escape x as x?html>
  ${user}
</#escape>
<#noescape>
  ${raw}
</#noescape>
<#compress>
  hi
</#compress>
<#noparse>
  <#literal>
</#noparse>
<#outputformat "HTML">
  ${html}
</#outputformat>
<#noautoesc>
  ${trusted}
</#noautoesc>
<#setting locale="en_US">
<#stop "fatal">
<#t>
<#lt>
<#rt>
<#nt>
<#ftl encoding="UTF-8" output_format="HTML">
