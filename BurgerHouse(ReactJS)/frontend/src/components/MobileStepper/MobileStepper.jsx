import React, { useState } from "react";
import { Button, Input, HStack } from "@chakra-ui/react";

const MobileStepper = ({ defaultValue = 0, min = 0, max = 10, handleAddItem, handleRemoveItem, price}) => {
  const [value, setValue] = useState(defaultValue);

  const increment = () => {
    if (value < max) {
      setValue(value + 1);
      handleAddItem(price);
    }
  };

  const decrement = () => {
    if (value > min) {
      setValue(value - 1);
      handleRemoveItem(price);
    }
  };


  return (
    <HStack spacing={4} padding='10px'>
      <Button onClick={decrement} size="sm">
        -
      </Button>
      <Input
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        size="sm"
        width="50px"
        textAlign="center"
      />
      <Button onClick={increment} size="sm">
        +
      </Button>
    </HStack>
  );
};

export default MobileStepper;
