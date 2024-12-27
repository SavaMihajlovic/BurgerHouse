import React, { useEffect, useState } from "react";
import { Button, Input, HStack } from "@chakra-ui/react";

const MobileStepper = ({ defaultValue = 0, min = 0, max = 10, handleAddItem, handleRemoveItem, price, itemKey}) => {
  const [value, setValue] = useState(defaultValue);

  const increment = () => {
    if (value < max) {
      const newValue = value + 1;
      setValue(newValue);
      handleAddItem(price, itemKey, newValue );
    }
  };

  const decrement = () => {
    if (value > min) {
      const newValue = value - 1;
      setValue(newValue);
      handleRemoveItem(price, itemKey, newValue );
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
