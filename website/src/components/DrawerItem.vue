<script setup>
import Image from 'primevue/image'
import Drawer from 'primevue/drawer';
</script>

<script>
export default {
  data() {
    return {visible: false}
  },
  props: ['color', 'name', 'callback'],
  computed: {
    background() {
        return {
            "background-color": this.color,
        }
    },
    drawerStyle() {
        return {
            "width": '100%',
            "background-color": this.color,
        }
    }
  },
}
</script>

<template>
    <Drawer v-model:visible="visible" header="Drawer" position="right" :style="drawerStyle" >
        <template #container>
            <slot name="drawer-content"></slot>
            <div @click="visible = false; if (callback) callback(false);" class='button-location'>
                
                <i class="pi pi-chevron-right"></i>
            </div>
        </template>
    </Drawer>
    <div class="item" :style="background" @click="visible = true">
      <Image>
          <template #image>
              <slot class="icon" name="icon"></slot>
          </template>
      </Image>
      <div class="name">
        {{ name }}
      </div>
    </div>
  </template>
  
  <style scoped>
    .name {
        margin-left: 2rem;
    }


  .item {
    display: flex;
    align-items: center;
    position: relative;
    fill: var(--color-text);
    transition: fill 0.1s;
    width: 10rem;
    height: 4rem;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    font-family: 'SaucerBB';
    padding: 1rem;
  }

  .item {
    display: flex;
    position: relative;
    margin: 1rem 0;
    right: -1rem;
    animation-name: wiggle;
    animation-duration: 4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
}

.item:nth-last-of-type(2) {
    animation-delay: -0.5s;
}

.item:nth-last-of-type(3) {
    animation-delay: -1s;
}

.item:hover {
    right: 0rem;
    box-shadow: var(--color-text) 0 0 2px 2px;
    animation: none;
    cursor: pointer;
}

.button-location {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    height: 100vh;
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
}

.button-location > i {
    animation-name: button-wiggle;
    animation-duration: 4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
}

.button-location > i::after {
    content: 'back';
    font-size: 1rem;
    transform-origin: top center;
    display: flex-block;
    float: left;
    transform: rotate(-90deg) translate(-25%, 0);
    font-family: Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif
}

@keyframes button-wiggle {
    0%      {padding-right: 0rem}
    50%     {padding-right: 1rem}
    100%    {padding-right: 0rem}
}

@keyframes wiggle {
    0%      {right: -1rem}
    50%     {right: 0rem}
    100%    {right: -1rem}
}
  
  
  @media (max-width: 1024px) {
    .item {
        width: 6rem;
        flex-direction: column;
        align-items: baseline;
    }

    .name {
        margin-left: 0.5rem;
        font-size: 0.75rem;
        white-space: nowrap;
    }

    .button-location > i::after {
        font-size: 0.5rem;
        transform-origin: top center;
        transform: rotate(-90deg) translate(-50%, 50%);
    }
  }
  </style>
  