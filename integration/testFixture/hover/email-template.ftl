<#-- realistic email-template fixture (HTML + FTL) -->
<#ftl output_format="HTML">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject?html}</title>
</head>
<body>
  <h1>Hello, ${recipient.name?cap_first}!</h1>

  <#if order.items?has_content>
    <p>Your recent order (#${order.id?string}):</p>
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      </thead>
      <tbody>
        <#list order.items as item>
          <tr>
            <td>${item.name?html}</td>
            <td>${item.qty}</td>
            <td>${item.price?string("0.00")}</td>
          </tr>
        </#list>
      </tbody>
    </table>
    <p>Total: ${order.total?string("0.00")}</p>
  <#else>
    <p>No items in this order.</p>
  </#if>

  <#assign supportEmail = "help@example.com">
  <footer>
    <p>Questions? <a href="mailto:${supportEmail?url}">${supportEmail?html}</a></p>
  </footer>
</body>
</html>
