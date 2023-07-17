# Azure Pipelines Task for Ballerina
[Ballerina](https://ballerina.io/) is a statically typed, open-source cloud-native programming language developed
and supported by [WSO2](https://wso2.com/).

With Ballerina, you could easily develop microservices, API endpoints and integrations,
and any other application for the cloud. Additionally, Ballerina has all the general-purpose
functionalities you could expect from a modern programming language.

Azure pipelines task for Ballerina provides a way to install Ballerina in Azure pipelines and use it in your devops pipelines. You can execute Ballerina CLI commands in your pipelines using this task. This includes building, testing, running, and pushing Ballerina programs.

## Getting Started
You can use the following YAML snippet to install Ballerina in your Azure pipeline.

```yaml
steps:
- task: UseBallerina@1
  inputs:
    version: '2201.6.0'
- script: bal -v
  displayName: 'Ballerina version'
```

## Useful links

* Chat live with us on our [Discord community](https://discord.com/invite/wAJYFbMrG2).
* Post technical questions on the Stack Overflow with the [#ballerina](https://stackoverflow.com/questions/tagged/ballerina) tag.
* For more details on how to engage with the community, see [Community](https://ballerina.io/community/).
