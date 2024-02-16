function changeThreme(state, pushState) {
  if(document.querySelector('body').classList.value == '') {
    document.querySelector('body').classList.add('light_threme');
    state.threme = 'light_threme';
  }
  else if(document.querySelector('body').classList.value == 'light_threme') {
    document.querySelector('body').classList.remove('light_threme');
    document.querySelector('body').classList.add('dark_threme');
    state.threme = 'dark_threme';
  }
  else {
    document.querySelector('body').classList.remove('dark_threme');
    state.threme = '';
  }

  pushState(state);
}

export { changeThreme };