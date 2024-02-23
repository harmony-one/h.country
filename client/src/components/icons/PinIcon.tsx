import React from "react";

export interface IIconProps {
  size?: string;
  color?: string;
}

export const PinIcon = (props: IIconProps) => {
  const { size = 50, color = 'black' } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      version="1"
      viewBox="0 0 380 363"
    >
      <path
        fill={color}
        d="M1742 3289c-424-41-798-340-938-753-37-108-54-218-54-351 0-212 36-346 159-588 164-321 428-716 735-1097 152-189 173-210 210-210 38 0 59 20 208 205 391 484 754 1060 847 1345 52 159 67 385 36 547-81 425-401 767-817 874-67 17-257 41-293 37-5 0-47-4-93-9zm293-573c171-61 307-207 359-385 25-86 21-223-9-318-126-399-638-518-931-217-199 205-208 539-21 754 70 80 174 146 277 176 65 19 261 13 325-10z"
        transform="matrix(.1 0 0 -.1 0 363)"
      ></path>
    </svg>
  );
}