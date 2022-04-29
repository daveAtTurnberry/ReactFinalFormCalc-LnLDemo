import React from 'react';
import { Field as FinalFormField, Form as FinalForm } from 'react-final-form';
import { Button, Form as SemanticForm, Table } from 'semantic-ui-react';
import createDecorator from 'final-form-calculate';
import arrayMutators from "final-form-arrays";
import { FieldArray } from "react-final-form-arrays";
import './App.css';

const miscFields = [
  {
    component: "input",
    display: "Sub Total",
    name: "subTotal",
    type: "number",
  },
  {
    component: "input",
    display: "Art Feel",
    name: "artFee",
    type: "number",
  },
  {
    component: "input",
    display: "Cert Fee",
    name: "certFee",
    type: "number",
  },
  {
    component: "input",
    display: "Expedite Fee",
    name: "expediteFee",
    type: "number",
  },
  {
    component: "input",
    display: "Fees Total",
    name: "feesTotal",
    type: "number",
  },
  {
    component: "input",
    display: "Taxes",
    name: "taxes",
    type: "number",
  },
  {
    component: "input",
    display: "Shipping",
    name: "shipping",
    type: "number",
  },
  {
    component: "input",
    display: "Total",
    name: "total",
    type: "number",
  },
  {
    component: "input",
    display: "Old Total",
    name: "oldTotal",
    type: "number",
  },
]

const addItem = (fields) => fields.push({ unitPrice: 1, quantity: 1.0 });
const removeItem = (fields, index) => fields.remove(index);

const calculator = createDecorator(
  {
    // When artFee, certFee, expeditedFee, taxes, shipping, or subTotal is updated...
    field: /(artFee|certFee|expediteFee|taxes|shipping|subTotal)/,
    updates: {
      // ...update the total field
      total: (unusedValue, allValues) => (
        Number(allValues.artFee || 0) +
        Number(allValues.certFee || 0) +
        Number(allValues.expediteFee || 0) +
        Number(allValues.taxes || 0) +
        Number(allValues.shipping || 0) +
        (allValues.invoiceItems.map(i => (i.quantity || 0) * (i.unitPrice || 0)) || []).reduce(
          (sum, value) => sum + value, 0
        )
      )
    }
  },
  {
    // When any invoiceItem quantity or unit price is updated...
    field: /(invoiceItems.*)/,
    updates: {
      // ...update the subtotal field
      // -- Note: Since we're updating subTotal, and subTotal is a trigger for the above calc,
      //          the above calc will run and update the total field
      subTotal: (unusedValue, allValues) =>  (
        (allValues.invoiceItems.map(i => (i.quantity || 0) * (i.unitPrice || 0)) || []).reduce(
          (sum, value) => sum + (value ?? 0), 0
        )
      )
    }
  },
  {
    // When artFee, certFee, or expediteFee is updated...
    field: /(artFee|certFee|expediteFee)/,
    updates: { 
      // ...update the feesTotal field
      feesTotal: (unusedValue, allValues) => (
        Number(allValues.artFee || 0) +
        Number(allValues.certFee || 0) +
        Number(allValues.expediteFee || 0)
      )
    }
  },
  {
    // When total is updated...
    field: /total/,
    updates: (value, name, allValues, prevValues) => {
      // ...update the oldTotal field
      // -- Note: In this example, we're manually defining the target field to be updated
      //          and setting the calculated value
      const oldTotal = "oldTotal";
      const oldTotalValue = prevValues.total ?? 0;
      return {
        [oldTotal]: oldTotalValue,
      };
    }
  },
  {
    // When total is updated...
    field: 'total',
    updates: {
      // ...update the howExpensive field
      howExpensive: (unusedValue, allValues) => {
        if (allValues.total > 10000) return "Too expensive";
        if (allValues.total > 1000) return "Fairly expensive";
        if (allValues.total >= 100) return "A little expensive";
        if (allValues.total < 100) return "It's doable";
      }
    }
  }
);

export const App = () => {
  return (
    <div className="App">
      <header className="App-header">Final Form Calculate Lunch & Learn</header>
      <FinalForm
        onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
        initialValues={{
          artFee: 0,
          certFee: 0,
          expediteFee: 0,
          taxes: 0,
          shipping: 0,
          invoiceItems: [{ quantity: 10, unitPrice: 5.00 }],
        }}
        decorators={[calculator]} // <- this is the calculator we defined above
        mutators={{ ...arrayMutators }}
        render={({ handleSubmit }) => (
          <SemanticForm onSubmit={handleSubmit}>
            <FieldArray name="invoiceItems">
              {({ fields }) => (
                <Table celled collapsing>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Quantity</Table.HeaderCell>
                      <Table.HeaderCell>Unit Price</Table.HeaderCell>
                      <Table.HeaderCell>Extended Price</Table.HeaderCell>
                      <Table.HeaderCell />
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {
                      fields.map((name, index) => (
                        <Table.Row key={name}>
                          <Table.Cell>
                            <FinalFormField
                              name={`${name}.quantity`}
                              component="input"
                              type="number"
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <FinalFormField
                              name={`${name}.unitPrice`}
                              component="input"
                              type="number"
                            />
                          </Table.Cell>
                          <Table.Cell>
                          {
                            (Number(fields.value[index].quantity || 0) *
                            Number(fields.value[index].unitPrice || 0)).toFixed(2)
                          }
                          </Table.Cell>
                          <Table.Cell>
                            {fields.length !== 1 && (
                              <Button
                                type="button"
                                onClick={() => removeItem(fields, index)}
                              >
                                Remove
                              </Button>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                  <Table.Footer>
                    <Table.Row>
                      <Table.Cell></Table.Cell>
                      <Table.Cell></Table.Cell>
                      <Table.Cell></Table.Cell>
                      <Table.Cell>
                        <Button
                          type="button"
                          onClick={() => addItem(fields)}
                          primary
                        >
                          Add Item
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Footer>
                </Table>
              )}
            </FieldArray>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell></Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  miscFields.map(f => (
                    <Table.Row key={`${f.name}`}>
                      <Table.Cell>{f.display}</Table.Cell>
                      <Table.Cell>
                        <FinalFormField
                          name={f.name}
                          component={f.component}
                          type={f.type}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))
                }
                <Table.Row>
                  <Table.Cell>How expensive is it?</Table.Cell>
                  <Table.Cell>
                    <FinalFormField
                      name="howExpensive"
                      component="input"
                      type="text"
                    />
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.Cell>
                    <Button type="submit">
                      Submit
                    </Button>
                  </Table.Cell>
                </Table.Row>
              </Table.Footer>
            </Table>
          </SemanticForm>
        )}
      />
    </div>
  );
}
