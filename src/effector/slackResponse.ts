
export const roomBlocks = (title: string, desc: string) => ({
  blocks: [
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": title
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": desc
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "N"
          },
          "value": "move_n"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "S"
          },
          "value": "move_s"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "E"
          },
          "value": "move_e"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "W"
          },
          "value": "move_w"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Up"
          },
          "value": "move_up"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Down"
          },
          "value": "move_down"
        }
      ]
    }
  ]
});