import { MoreVert } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";

function MoreOptions({
  config,
}: {
  config: Array<{
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        aria-label="more"
        id={`actions`}
        aria-controls={`menu`}
        aria-haspopup="true"
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
        }}
        size="small"
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        id={`menu`}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {config.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleClose();
              option.onClick();
            }}
            disabled={option.disabled}
          >
            {option.icon && (
              <Box component="span" sx={{ mr: 1, display: "flex" }}>
                {option.icon}
              </Box>
            )}
            <Typography variant="body2">{option.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
export { MoreOptions };
