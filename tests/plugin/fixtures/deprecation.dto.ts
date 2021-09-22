export const deprecationDtoText = `
export class CreateCatDto2 {
  /**
  * name description
  *  
  * @deprecated
  */
  name: string;
  
  /**
  * @deprecated consult docs for better alternative!
  */
  breed: string;
}
`;

export const deprecationDtoTranspiled = `export class CreateCatDto2 {
    static _GRAPHQL_METADATA_FACTORY() {
        return { name: { type: () => String, description: "name description", deprecationReason: "deprecated" }, breed: { type: () => String, deprecationReason: "consult docs for better alternative!" } };
    }
}
`;
