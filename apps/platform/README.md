### generate client

```
openapi-generator-cli generate -i ./apps/platform/resources/openapi-docs.json -g typescript-axios -o libs/clients/platform-client/src/lib/generated -c ./apps/platform/resources/openapi-server-generator.config.yaml
```

[](https://)


What is a tenant? 

Tenant is a logical grouping of users, and it can be a company, organization, group of people, etc. Examples: 

1. Slack - workspace
2. LinkedIn - company
3. DropBox - team
4. GitHub - organization
5. Apple Store - developer account
6. Amazon - seller
7. AirBnb - host
8. Google - organization
9. Microsoft - organization
10. Facebook - business account



We do support 3 main modes: 

1. `single tenant mode` - all users are in the same tenant, and the tenant is not specified in the request. Tenant populated in the request, and when custom is registering he need to provide tenant identifier, apps and platforms like zoho, salesforce, pipedrive, recruitee, hubspot, mailchimp and many more.
User with the same email can't be registered for different tenants.
This mode is ideal for B2B apps, and can work for B2B2C (Apple Store, Amazon, AirBnb).
   1.1. Url management - we do support 3 modes on backend side, and you can choose one of them. 
      1.1.1. `subdomain` - tenant identifier is a subdomain, like `tenant1.myapp.com`, `tenant2.myapp.com`
      1.1.2. `main domain` - tenant identifier is not needed and user just logging in to the main domain, like `myapp.com`
      1.1.2. `path` - tenant identifier is a path, like `myapp.com/tenant1`, `myapp.com/tenant2`

   1.2. Tenant provisioning in any case done by the first user that is registering the system, and he chooses this identifier

In any case tenant id will be populated from jwt token, and you don't need to pass it in the request.


2. `multi tenant mode` - users can belong to the different tenants and tenant can manage their users individually. 
This one is ideal 
for B2C2B (Slack, LinkedIn, DropBox, GitHub, Notion, etc.)

2.1. Url management

 2.1.1. `main domain` - tenant identifier is not needed and user just logging in to the main domain, like `myapp.com`, 
 2.1.2. `path` - tenant identifier is a path, like `myapp.com/tenant1`, `myapp.com/tenant2`, where the main path myapp.com usually showing either combined data (like GitHub) or personal data (like Notion)

2.2. Tenant provisioning is done implicitly while registration (like Slack) or explicitly by creating it after login (like GitHub - organizations, Notion - spaces)

2.3. All tenant ids, and basic tenant info will be presented in the jwt token
2.4. Tenant switch can be implemented in 2 ways: 
  2.4.1. `tenant switcher` - user can switch between tenants, and it is a common case for B2C2B apps, like Slack, Notion, GitHub, etc.
  2.4.2. `tenant selector` - user can select tenant right after login

2.5. Current tenant id can be populated these ways: 

    2.5.1. Through `header`, X-TENANT-ID
    2.5.2. Through `path` - like `myapp.com/tenant1`, `myapp.com/tenant2`

3. `no tenant`, it is an obvious B2C case, and we do support it as well. Apps like Uber, any ecommerce app, dating, etc...


As a general rule of thumb is good to support multi tenancy nowadays, there is always a chance that app will expand and will need to support multi tenancy, and it is better to have it from the beginning.

We had about 10 cases where apps started as single tenant and later business owners thought to spread the cost and start selling this app as SaaS
So this is quite common
If you are thinking to do a single tenant, you can just choose `tenant switcher` and threat it as a single tenant 




