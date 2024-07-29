# persistence-api

This module contains the API for the persistence layer. It defines the interfaces that the persistence layer must implement.

The main purpose is to provide a common interface for the persistence layer, so that the business layer can be decoupled from the actual implementation of the persistence layer 
and we can easily switch between different implementations and even ORMs. 
